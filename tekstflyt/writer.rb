require 'rubygems'
require 'bcrypt'

Writer = Struct.new :_id, :name, :flow_count, :password_hash, :password_salt, :longest_flow, :total_words do
    def sanitize!
        self.password_hash = nil
        self.password_salt = nil
        self
    end

    def to_mongo
        mongo_obj = {}
        WriterManager::RUBY_TO_MONGO.each do |key, val|
            mongo_obj[val] = self[key] if self[key]
        end
        mongo_obj.delete(:_id)
        return mongo_obj
    end

    def to_liquid
        liquid_obj = {}
        WriterManager::RUBY_TO_MONGO.each do |key, val|
            liquid_obj[key.to_s] = self[key] if self[key]
        end
        return liquid_obj
    end
end

class WriterManager
    RUBY_TO_MONGO = {_id: :_id, name: :n, flow_count: :fc, password_hash: :ph, password_salt: :ps, longest_flow: :lf, total_words: :tw}.freeze
    MONGO_TO_RUBY = RUBY_TO_MONGO.invert.freeze

    def initialize(tekstflyt)
        @tekstflyt = tekstflyt
        @writer_db = @tekstflyt.db.collection('writers')
    end

    def mongo_to_ruby(mongo_obj)
        writer = Writer.new
        mongo_obj.each do |key, val| 
            writer[MONGO_TO_RUBY[key.to_sym]] = val if val
        end
        return writer
    end

    def create(name, password)
        return nil if find_by_name(name)

        password_salt = BCrypt::Engine.generate_salt
        password_hash = BCrypt::Engine.hash_secret(password, password_salt)

        writer = Writer.new
        writer.name = name
        writer.password_hash = password_hash
        writer.password_salt = password_salt
        writer.total_words = 0
        writer.longest_flow = 0
        writer.flow_count = 0
        writer._id = BSON::ObjectId.new

        mongo_obj = writer.to_mongo
        @writer_db.insert(mongo_obj)
        @tekstflyt.increment_user_count!

        writer = find_by_name(name)

        return writer.sanitize!
    end

    def login(name, password)
        writer = find_by_name(name)
        return nil if writer.nil?
        (writer && writer.password_hash == BCrypt::Engine.hash_secret(password, writer.password_salt)) ? writer.sanitize! : nil
    end

    # Increment flow count and return the new flow count
    def inc_flow_count(writer)
        #ret = @writer_db.find_and_modify(query: {_id: writer._id}, update: {'$inc' => {fc: 1}}, new: true)
        @writer_db.update({_id: writer._id}, {'$inc' => {fc: 1}})
        @writer_db.find_one(query: {_id: writer._id})['fc']
    end

    def find_all
        return @writer_db.find().to_a.map {|w| mongo_to_ruby(w).to_liquid }
    end

    def find_by_name(name)
        writer = @writer_db.find_one({n: name})
        return writer ? mongo_to_ruby(writer) : nil
    end

    def update_stats(writer, longest_flow, words)
        longest_flow, words = longest_flow.to_i, words.to_i
        writer.total_words += words
        writer.longest_flow = longest_flow if longest_flow > writer.longest_flow

        @writer_db.update({_id: writer._id}, {'$set' => {lf: writer.longest_flow, tw: writer.total_words}})
    end
end


