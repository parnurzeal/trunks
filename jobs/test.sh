#!/bin/bash

curl -XPOST -i localhost:1337/testplan/create -H "Content-Type: application/json" -d @test.json
