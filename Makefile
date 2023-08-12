build:
  docker build -t botden .

run:
  docker run -d -p 3000:3000 --name botden --rm botden