build:
	docker build -t soso .

run:
	docker run -d -p 3000:3000 --name soso --rm soso