require "rubygems"
require "bundler/setup"
require "mongo"
require_relative './tekstflyt/tekstflyt'

mongo_client = Mongo::MongoClient.new('localhost', 27017)
tekstflyt = Tekstflyt.new(Mongo::MongoClient.new('localhost', 27017))
writer_m = tekstflyt.writer_m
draft_m = tekstflyt.draft_m

task :clean do |t|
    mongo_client.drop_database('tekstflyt')
end

task :setup do |t|
    db = mongo_client.db('tekstflyt')
    db.collection('tekstflyt').insert({name: 'data', users: 0, drafts: 0})
    writer_m.create("zen", "zen")
end

task :start do |t|
    `chromium --incognito 0.0.0.0:4567`
    `ruby main.rb`
end

task :go => [:clean, :setup, :start] do |t|
end
