build:
	docker build -t botden1 .

run:
	docker run -d -p 3000:3000 --name botden1 --rm botden1