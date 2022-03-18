<?php

if (!(defined('WP_CLI') && WP_CLI)) {
    return;
}

class Algolia_Command {
    public function reindex_post($args, $assoc_args) {
        global $algolia;
        $index = $algolia->initIndex('Admissions');
        
        //Clear previous index
        $index->deleteBy(['filters'=>'type:wp'])->wait();
            
        $paged = 1;
        $count = 0;
  
        do {
            $posts = new WP_Query([
                'posts_per_page' => 100,
                'paged' => $paged,
                'post_type' => ['page','post']
            ]);
  
            if (!$posts->have_posts()) {
                break;
            }
  
            $records = $entries = [];
  
            foreach ($posts->posts as $post) {

                $post_tags = wp_get_post_tags($post->ID);
                $tag_name_array=[];
                $tags='';
                if (count($post_tags)){
                    foreach ($post_tags as $post_tag){
                        $tag_name_array[]=$post_tag->name;
                    }
                    $tags=implode(', ',$tag_name_array);
                }
                

                if (isset($assoc_args['verbose']) && $assoc_args['verbose']) {
                    WP_CLI::line('Serializing ['.$post->post_title.']');
                }
                $record = (array) apply_filters('post_to_record', $post);
                
                
                $entry=[];
                $entry['title'] = $record['post_title'];
                $entry['description'] = strip_shortcodes($record['post_content']);
                $entry['url'] = get_permalink($post);
                $entry['tags'] = $tags;
                $entry['id'] = $entry['objectID'] = implode('-', ["wp",$post->post_type, $post->ID]);
                $records[] = $entry;

                $count++;
            }
  
            if (isset($assoc_args['verbose']) && $assoc_args['verbose']) {
                WP_CLI::line('Sending batch');
            }
  
            $index->saveObjects($records);
  
            $paged++;
  
        } while (true);
  
        WP_CLI::success("$count posts indexed in Algolia");
    }
  }
  

WP_CLI::add_command('algolia', 'Algolia_Command');
