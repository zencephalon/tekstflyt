require 'rubygems'
require 'pathname'
require 'mongo'
require_relative 'writer'
require_relative 'flow'

class Tekstflyt
    attr_reader :db, :writer_m, :flow_m

    def initialize(client)
        @client = client
        @db = @client.db('tekstflyt')
        @tekstdb = @db.collection('tekstflyt')
        @writer_m = WriterManager.new(self)
        @flow_m = FlowManager.new(self)
    end

    def increment_user_count!
        @tekstdb.find_and_modify(query: {name: 'data'}, update: {'$inc' => {users: 1}}, new: true)['users']
    end

    def increment_flow_count
        @tekstdb.find_and_modify(query: {name: 'data'}, update: {'$inc' => {flows: 1}}, new: true)['flows']
    end

    def increment_word_count(words)
        @tekstdb.find_and_modify(query: {name: 'data'}, update: {'$inc' => {words: words}}, new: true)['words']
    end

    def stats
        @tekstdb.find_one({name: 'data'})
    end

    def user_count
        @tekstdb.find_one({name: 'data'}, fields: ['users'])['users']
    end

    def flow_count
        @tekstdb.find_one({name: 'data'}, fields: ['flows'])['flows']
    end

    def word_count
        @tekstdb.find_one({name: 'data'}, fields: ['words'])['words']
    end
end
