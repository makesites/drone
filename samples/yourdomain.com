
# compress some assets with gzip
gzip on;
gzip_comp_level 2;
gzip_proxied any;
gzip_types text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript;
gzip_buffers 16 8k;
gzip_vary on;


upstream node {
    server 127.0.0.1:80;
}

# the nginx server instance
server {
    listen 3000;
    server_name yourdomain.com yourdomain;
    access_log /var/log/nginx/yourdomain.log;
    root /var/www/yourdomain.com/html;

    # Serve favicons with 7 day expire headers / Serve the other assets with a 3 hours expire headers
	
	location ~* ^.+\.ico$ {
	  access_log        off;
	  expires           7d;
	}
	
	location ~* ^.+\.(jpg|jpeg|gif|png|css|js|mp3)$ {
	  access_log        off;
	  expires           3h;
	}
	
    # Proxy the request to the node process if the asset is not found
	# try_files $uri @node;
     
    # pass the request to the node.js server with the correct headers and much more can be added, see nginx config options

	location @node {
	  proxy_set_header  X-Real-IP        $remote_addr;
	  proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;
	  proxy_set_header  Host             $http_host;
	  proxy_redirect    off;
	  proxy_pass        http://node;
	}
	
 }
