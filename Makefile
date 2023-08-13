build:
	docker build -t dengpt .

run:
	docker run -d -p 3000:3000 --name dengpt --rm dengpt