Flow = Struct.new :_id, :text, :title, :score, :writer, :number, :writer_name, :mode, :wordcount, :timer, :modescore do
    def to_mongo
        mongo_obj = {}
        FlowManager::RUBY_TO_MONGO.each do |key, val|
            mongo_obj[val] = self[key] if self[key]
        end
        return mongo_obj
    end

    def to_liquid
        liquid_obj = {}
        FlowManager::RUBY_TO_MONGO.each do |key, val|
            liquid_obj[key.to_s] = self[key] if self[key]
        end
        return liquid_obj
    end
end

class FlowManager
    RUBY_TO_MONGO = {_id: :_id, text: :tx, writer: :w, title: :tl, score: :s, number: :n, writer_name: :wn, mode: :m, wordcount: :wc, timer: :tm, modescore: :ms}.freeze
    MONGO_TO_RUBY = RUBY_TO_MONGO.invert.freeze

    def initialize(tekstflyt)
        @tekstflyt = tekstflyt
        @flow_db = @tekstflyt.db.collection('flows')
    end

    def mongo_to_ruby(mongo_obj)
        flow = Flow.new
        mongo_obj.each do |key, val| 
            flow[MONGO_TO_RUBY[key.to_sym]] = val if val
        end
        return flow
    end

    def create(writer, text, score, title, mode, timer, wordcount)
        flow = Flow.new
        flow.text = text
        flow.title = title || Time.now.strftime("%D %H:%M")
        flow.score = score.to_i
        flow.number = @tekstflyt.writer_m.inc_flow_count(writer)
        flow.writer = writer._id
        flow.writer_name = writer.name
        flow.mode = mode
        flow.timer = timer.to_i
        flow.wordcount = wordcount.to_i
        flow.modescore = flow.score.to_f / flow.wordcount if (mode == "wordcount")
        flow.modescore = flow.score.to_f / flow.timer if (mode == "timer")

        mongo_obj = flow.to_mongo
        @flow_db.insert(mongo_obj)

        return flow
    end

    def get(writer, number)
        flow = @flow_db.find_one({w: writer._id, n: number.to_i})
        return flow ? mongo_to_ruby(flow) : nil
    end

    def get_all_by_writer(writer)
        @flow_db.find({w: writer._id}).to_a.map {|f| mongo_to_ruby(f).to_liquid}
    end

    def get_by_score(mode, n, sort)
        @flow_db.find({m: mode}, {limit: n}).sort(ms: sort).to_a.map {|f| mongo_to_ruby(f).to_liquid}
    end
end
