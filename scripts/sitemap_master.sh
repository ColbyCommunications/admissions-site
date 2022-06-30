EDGE_HOSTNAME="afa.colby.edu"
JQ="https://${EDGE_HOSTNAME}"
echo $(cat .github/sitemap.json | jq -r --arg JQ "$JQ" '.urls += [$JQ]') > .github/sitemap.json
cat .github/sitemap.json
