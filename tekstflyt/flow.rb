Flow = Struct.new :_id, :text, :title, :score, :writer, :number do
    def to_mongo
        flow, mongo_obj = self.to_h, {}
        flow.each do |key, val|
            mongo_obj[FlowManager::RUBY_TO_MONGO[key]] = val if val
        end
        return mongo_obj
    end

    def to_liquid
        flow, liquid_obj = self.to_h, {}
        flow.each do |key, val|
            liquid_obj[key.to_s] = val if val
        end
        return liquid_obj
    end
end

class FlowManager
    RUBY_TO_MONGO = {_id: :_id, text: :tx, writer: :w, title: :tl, score: :s, number: :n}.freeze
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

    def create(writer, text, score)
        number = @tekstflyt.writer_m.inc_flow_count(writer._id)

        flow = Flow.new
        flow.text = text
        flow.title = Time.now.strftime("%D %H:%M")
        flow.score = score
        flow.writer = writer._id

        mongo_obj = flow.to_mongo
        @flow_db.insert(mongo_obj)

        return flow
    end

    def get(writer, number)
        flow = @flow_db.find_one({:w => writer._id, :n => n.to_i})
        return flow ? mongo_to_ruby(flow) : nil
    end

    def get_all_by_writer(writer)
        @flow_db.find({:w => writer._id}).to_a
    end
end
