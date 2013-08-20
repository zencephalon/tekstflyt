require 'rubygems'
require 'bundler/setup'

require 'sinatra'
require 'mongo'
require 'redcloth'
require 'puma'

require_relative './tekstflyt/tekstflyt'

class Prose < Sinatra::Base
    enable :sessions
    set :bind, '0.0.0.0'

    $tekstflyt = Tekstflyt.new(Mongo::MongoClient.new('localhost', 27017))
    $flow_m = $tekstflyt.flow_m
    $writer_m = $tekstflyt.writer_m

    helpers do
        def logged_in?
            !session[:writer].nil?
        end

        def writer
            session[:writer]
        end

        def locals(hash = {})
            hash[:writer] = writer ? writer.name : nil
            hash[:logged_in] = logged_in?
            hash
        end
    end

    set(:auth) do |roles|
      condition do
          redirect "/", 303 unless logged_in?
      end
    end

    # =========================================================================

    get "/" do
        stats = $tekstflyt.stats
        liquid :index, locals: locals(title: "Welcome!", stats: stats)
    end

    # ====================== Flows ============================================

    ["/flow", "/f"].each do |path|
        post "#{path}", auth: :writer do
            flow = $flow_m.create(writer, params[:text], params[:score], params[:title], params[:mode], params[:timer], params[:wordcount])
            $writer_m.update_stats(writer, params[:longest_flow], params[:wordcount])
            "#{path}/#{flow.number}/view"
        end

        get "#{path}", auth: :writer do
            redirect "/w/#{writer.name}"
        end

        get "#{path}/new" do
            liquid :mode_select, locals: locals()
        end

        get "#{path}/edit", auth: :writer do
            local_hash = {}

            if (! %w(wordcount timer).include?(params[:mode]))
                redirect "#{path}/new"
            end

            params[:wordcount] = 500 if params[:wordcount].to_i <= 0
            params[:timer] = 5 if params[:timer].to_i <= 0

            [:mode, :wordcount, :timer, :kittens].each do |sym|
                local_hash[sym] ||= params[sym]
            end
            liquid :tekstflyt, locals: locals(local_hash)
        end

        get "#{path}/:num/view", auth: :writer do
            flow = $flow_m.get(writer, params[:num])

            redirect "#{path}" if flow.nil?

            liquid :flow_display, locals: locals(title: flow.title, text: flow.text, score: flow.score)
        end
    end

    get "/w/:name/f/:num" do
        writer = $writer_m.find_by_name(params[:name])
        flow = $flow_m.get(writer, params[:num])

        redirect "/w/#{params[:name]}" if flow.nil?

        liquid :flow_display, locals: locals(title: flow.title, text: flow.text, score: flow.score)
    end

    # ====================== Users ================================================

    get "/w/:name" do
        w = $writer_m.find_by_name(params[:name])

        redirect "/w" if w.nil?

        flows = $flow_m.get_all_by_writer(w)
        liquid :writer, locals: locals(flows: flows, cwriter: w.to_liquid)
    end

    get "/w" do
        writers = $writer_m.find_all
        liquid :writer_list, locals: locals(writers: writers)
    end

    get "/signup" do
        liquid :signup, locals: locals(title: "Signup!")
    end

    get "/highscores" do
        timer_flows = $flow_m.get_by_score('timer', 20, :desc)
        wordcount_flows = $flow_m.get_by_score('wordcount', 20, :desc)
        liquid :highscores, locals: locals(timer_flows: timer_flows, wordcount_flows: wordcount_flows)
    end

    post "/signup" do
        username = params[:username]

        if $writer_m.find_by_name(username)
            redirect "/login"
        end

        # save into mongodb
        session[:writer] = $writer_m.create(username, params[:password])

        redirect "/"
    end

    get "/login" do
        liquid :login, locals: locals
    end

    post "/login" do
        if writer = $writer_m.login(params[:username], params[:password])
            session[:writer] = writer
            redirect "/"
        else
            liquid :login, locals: locals(error: true)
        end
    end

    get "/logout" do
        session[:writer] = nil
        redirect "/"
    end

    not_found do
        liquid :fourohfour, layout: false
    end

    error do
        liquid :fivehundred, layout: false
    end

end

if __FILE__ == $0
    Prose.run!
end
