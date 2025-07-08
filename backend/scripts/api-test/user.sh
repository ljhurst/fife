#!/bin/bash

source "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/env.sh"

user_id="5478f418-7051-70d7-0031-7634eb4d6b04"

get_response=$(
    curl \
        -s \
        "$API_HOST/user/$user_id" \
        -X GET \
        -H "Content-Type: application/json"
)

echo "Get User Response: $(echo "$get_response" | jq '.')"
echo

espp_lot_list_response=$(
    curl \
        -s \
        "$API_HOST/user/$user_id/espp-lot" \
        -X GET \
        -H "Content-Type: application/json"
)

echo "ESPP Lot List Response: $(echo "$espp_lot_list_response" | jq '.')"
echo
