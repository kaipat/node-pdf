.PHONY: build

APP=node-pdf

serve:
	docker build -t $(APP) .
	docker stop $(APP) || true
	docker rm $(APP) -f || true
	docker run -d -p 3030:3030 --name $(APP) $(APP):latest
	docker container prune -f
	docker image prune -a -f



