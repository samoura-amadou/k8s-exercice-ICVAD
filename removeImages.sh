docker rmi $(docker images | grep '<none>' | awk $3 '{printf "%s ", $3}')
