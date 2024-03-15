<?php

if ( ! ( defined( 'WP_CLI' ) && WP_CLI ) ) {
	return;
}

class Algolia_Command {
	public function reindex_post( $args, $assoc_args ) {
		global $algolia;
		$index = $algolia->initIndex( 'Admissions' );

		//Clear previous index
		$index->deleteBy( array( 'filters' => 'type:wp' ) )->wait();

		$paged = 1;
		$count = 0;

		do {
			$posts = new WP_Query(
				array(
					'posts_per_page' => 100,
					'paged'          => $paged,
					'post_type'      => array( 'page', 'post', 'counselors' ),
				)
			);

			if ( ! $posts->have_posts() ) {
				break;
			}

			$records = $entries = array();

			foreach ( $posts->posts as $post ) {

				// exclude ASP from search
				if ($post->ID === 5198) {
					continue;
				}

				$post_tags      = wp_get_post_tags( $post->ID );
				$tag_name_array = array();
				$tags           = '';
				if ( count( $post_tags ) ) {
					foreach ( $post_tags as $post_tag ) {
						$tag_name_array[] = $post_tag->name;
					}
					$tags = implode( ', ', $tag_name_array );
				}

				if ( isset( $assoc_args['verbose'] ) && $assoc_args['verbose'] ) {
					WP_CLI::line( 'Serializing [' . $post->post_title . ']' );
				}
				$record = (array) apply_filters( 'post_to_record', $post );

				$entry = array();
				if ( get_post_type( $post ) !== 'counselors' ) {
					$entry['title']       = $record['post_title'];
					$entry['description'] = 
					!empty(trim(implode(get_post_meta($post->ID, '_yoast_wpseo_metadesc'))))
					? trim(implode(get_post_meta($post->ID, '_yoast_wpseo_metadesc')))
					: "Apply to Colby College and learn more about financial aid opportunities.";
					$entry['url']         = get_permalink( $post );
					$entry['tags']        = $tags;
				} else {
					$counselor_post_meta  = get_post_meta( $post->ID );
					$first_name           = $counselor_post_meta['first_name'][0];
					$last_name            = $counselor_post_meta['last_name'][0];
					$job_title            = $counselor_post_meta['job_title'][0];
					$email                = $counselor_post_meta['email'][0];
					$phone                = $counselor_post_meta['phone'][0];
					$entry['title']       = "{$first_name} {$last_name}";
					$entry['description'] = "{$first_name} {$last_name} - {$job_title} - {$email} - {$phone}";
					$entry['url']         = 'https://afa.colby.edu/counselors/';
				}
				$entry['type'] = 'wp';
				$entry['id']   = $entry['objectID'] = implode( '-', array( 'wp', $post->post_type, $post->ID ) );
				$records[]     = $entry;

				$count++;
			}

			if ( isset( $assoc_args['verbose'] ) && $assoc_args['verbose'] ) {
				WP_CLI::line( 'Sending batch' );
			}

			$index->saveObjects( $records );

			$paged++;

		} while ( true );

		WP_CLI::success( "$count posts indexed in Algolia" );
	}
}


WP_CLI::add_command( 'algolia', 'Algolia_Command' );
