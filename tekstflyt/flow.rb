Flow = Struct.new :_id, :text, :title, :score do
    def to_mongo
        flow, mongo_obj = self.to_h, {}
        flow.each do |key, val|
            mongo_obj[FlowManager::RUBY_TO_MONGO[key]] = val if val
        end
        return mongo_obj
    end
end

class FlowManager
    RUBY_TO_MONGO = {_id: :_id, text: :tx, title: :tl, score: :s, number: :n}.freeze
    MONGO_TO_RUBY = RUBY_TO_MONGO.invert.freeze

    def initialize(tekstflyt)
        @tekstflyt = tekstflyt
        @flow_db = @tekstflyt.db.collection('flows')
    end

    def create(writer, text, score)
        number = @tekstflyt.writer_m.inc_flow_count(writer._id)

        flow = Flow.new
        flow.text = text
        flow.title = Time.now.strftime("%D %H:%M")
        flow.score = score

        mongo_obj = flow.to_mongo
        @flow_db.insert(mongo_obj)

        return flow
    end


end
