APP=node-pdf
SERVER=ubuntu@42.192.19.156

serve:
	docker build -t $(APP) .
	docker stop $(APP) || true
	docker rm $(APP) -f || true
	docker run -d -p 3030:3030 --name $(APP) $(APP):latest
	docker container prune -f
	docker image prune -a -f

development:
	tar -czvf $(APP).tar.gz --exclude=node_modules --exclude=.git --exclude=.idea --exclude=.DS_Store .
	ssh -o StrictHostKeyChecking=no -i ~/.ssh/id_rsa -t $(SERVER) "rm -rf ~/web-build/webdict_web_upload && mkdir ~/web-build/webdict_web_upload"
	scp $(APP).tar.gz ${SERVER}:~/web-build/webdict_web_upload/
	rm $(APP).tar.gz
	ssh -o StrictHostKeyChecking=no -i ~/.ssh/id_rsa -t $(SERVER) "cd ~/web-build/webdict_web_upload && tar -xzvf $(APP).tar.gz && make serve"

