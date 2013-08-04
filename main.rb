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
            if session[:writer].nil?
                return false
            else
                return true
            end
        end

        def writer
            return session[:writer]
        end

        def locals(hash = {})
            hash[:writer] = writer ? writer.name : nil
            hash[:logged_in] = logged_in?
            return hash
        end
    end

    set(:auth) do |roles|
      condition do
        unless logged_in?
          redirect "/", 303
        end
      end
    end

    # =============================================================================

    get "/" do
        liquid :index, locals: locals(title: "Welcome!")
    end

    # ====================== Drafts ===============================================

    get "/tekstflyt" do
        liquid :tekstflyt
    end

    ["/flow", "/f"].each do |path|
        post "#{path}", auth: :writer do
            $flow_m.create(writer, params[:text], params[:score])
            redirect '/'
        end

        get "#{path}", auth: :writer do
            flows = $flow_m.get_all_by_writer(writer)
            liquid :flow_list, locals: locals(flows: flows)
        end

        get "#{path}/new", auth: :writer do
            liquid :mode_select, locals: locals()
        end

        get "#{path}/edit", auth: :writer do
            liquid :tekstflyt, locals: locals(text: "")
        end

        get "#{path}/:num/view", auth: :writer do
            flow = $flow_m.get(writer, params[:num])
            liquid :flow_display, locals: locals(title: flow.title, text: flow.text, score: flow.score)
        end
    end

    get "/w/:name/f/:num" do
        writer = $writer_m.find_by_name(params[:name])
        flow = $flow_m.get(writer, params[:num])

        liquid :flow_display, locals: locals(title: flow.title, text: flow.text, score: flow.score)
    end

    # ====================== Users ================================================

    get "/w/:name" do
        w = $writer_m.find_by_name(params[:name])
        flows = $flow_m.get_all_by_writer(w)
        liquid :public_flow_list, locals: locals(flows: flows, writer: w.name)
    end

    get "/w" do
        writers = $writer_m.find_all
        liquid :writer_list, locals: locals(writers: writers)
    end

    get "/signup" do
        liquid :signup, locals: locals(title: "Signup!")
    end

    get "/highscores" do
        flows = $flow_m.get_by_score(20, :asc)
        liquid :highscores, locals: locals(flows: flows)
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
            liquid :login_error, locals: locals
        end
    end

    get "/logout" do
        session[:writer] = nil
        redirect "/"
    end
end

if __FILE__ == $0
    Prose.run!
end
