#!/bin/bash

source "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/env.sh"

create_response=$(
    curl \
        -s \
        "$API_HOST/espp/lot" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "userId": "12345",
            "grantDate": "2023-01-01",
            "purchaseDate": "2023-06-01",
            "offerStartPrice": 10.00,
            "offerEndPrice": 15.00,
            "purchasePrice": 12.00,
            "shares": 100.0
        }'
)

echo "Create ESPP Lot Response: $(echo "$create_response" | jq '.')"
echo

lot_id=$(echo "$create_response" | jq -r '.id')

get_response=$(
    curl \
        -s \
        "$API_HOST/espp/lot/$lot_id" \
        -X GET \
        -H "Content-Type: application/json"
)

echo "Get ESPP Lot Response: $(echo "$get_response" | jq '.')"
echo

delete_response=$(
    curl \
        -s \
        "$API_HOST/espp/lot/$lot_id" \
        -X DELETE \
        -H "Content-Type: application/json"
)

echo "Delete ESPP Lot Response: $(echo "$delete_response" | jq '.')"
