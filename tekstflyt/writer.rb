require 'rubygems'
require 'bcrypt'

Writer = Struct.new :_id, :name, :flow_count, :password_hash, :password_salt do
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
        return mongo_obj
    end
end

class WriterManager
    RUBY_TO_MONGO = {_id: :_id, name: :n, flow_count: :fc, password_hash: :ph, password_salt: :ps}.freeze
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

        mongo_obj = writer.to_mongo
        @writer_db.insert(mongo_obj)

        return writer.sanitize!
    end

    def login(name, password)
        writer = find_by_name(name)
        return nil if writer.nil?
        File.open("log", "w") do |f|
            f.puts writer.password_hash
            f.puts BCrypt::Engine.hash_secret(password, writer.password_salt)
        end
        (writer && writer.password_hash == BCrypt::Engine.hash_secret(password, writer.password_salt)) ? writer.sanitize! : nil
    end

    # Increment flow count and return the new flow count
    def inc_flow_count(writer)
        @writer_db.find_and_modify(query: {_id: writer._id}, update: {'$inc' => {fc: 1}}, fields: {fc: true}, new: true)['fc']
    end

    def find_all
        return @writer_db.find().to_a
    end

    def find_by_name(name)
        writer = @writer_db.find_one({n: name})
        return writer ? mongo_to_ruby(writer) : nil
    end
end


