#!/usr/bin/env bash

DEV_HOSTNAME=$(echo $PLATFORM_ROUTES | base64 --decode | jq 'keys[0]' | tr -d \")

if [ "${PLATFORM_BRANCH}" != master ]; then
  echo "Running: wp search-replace 'https://${PRIMARY_DOMAIN}/' '${DEV_HOSTNAME}' --all-tables"
  wp search-replace "https://${PRIMARY_DOMAIN}/" "${DEV_HOSTNAME}" --all-tables

  echo "Publishing Test Page"
  TEST_PAGE_ID=$(wp db query 'select ID from wp_posts  WHERE post_title="Test Page" AND post_type = "page"' --skip-column-names)
  wp post update ${TEST_PAGE_ID} --post_status=publish
fi