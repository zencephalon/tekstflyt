require 'rubygems'
require 'pathname'
require 'mongo'
require_relative 'writer'
require_relative 'flow'

class Tekstflyt
    attr_reader :db, :data_dir, :writer_m, :flow_m

    def initialize(client)
        @client = client
        @db = @client.db('tekstflyt')
        @writer_m = WriterManager.new(self)
        @flow_m = FlowManager.new(self)
    end

    def increment_user_count!
        @db.collection('tekstflyt').find_and_modify(query: {name: 'data'}, update: {'$inc' => {users: 1}}, new: true)['users']
    end

    def increment_flow_count
        @db.collection('tekstflyt').find_and_modify(query: {name: 'data'}, update: {'$inc' => {flows: 1}}, new: true)['flows']
    end
end
