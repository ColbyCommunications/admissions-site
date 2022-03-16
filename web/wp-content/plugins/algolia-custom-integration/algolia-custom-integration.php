<?php

/**
 * Plugin Name:     Algolia Custom Integration
 * Description:     Add Algolia Search feature
 * Text Domain:     algolia-custom-integration
 * Version:         1.0.0
 *
 * @package         Algolia_Custom_Integration
 */

require_once __DIR__ . '/api-client/autoload.php';
// If you're using Composer, require the Composer autoload
// require_once __DIR__ . '/vendor/autoload.php';

global $algolia;

$algolia = \Algolia\AlgoliaSearch\SearchClient::create("2XJQHYFX2S", "69e4615fdea07b1ce2222585bb45306d");

require_once __DIR__ . '/wp-cli.php';
