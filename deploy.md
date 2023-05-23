At least one time

```sh
minikube start
docker run -d -p 5000:5000 --restart=always --name registry registry:2
minikube addons enable registry
```

Before build in a terminal

For linux/mac

```sh
eval $(minikube -p minikube docker-env)
```

For windows

```sh
@FOR /f "tokens=*" %i IN ('minikube -p minikube docker-env --shell cmd') DO @%i
```

Start a local registry

```sh
docker build ...
docker tag  {name} localhost:5000/{name}
docker push localhost:5000/{name}
```

Use yaml file

To create

```sh
kubectl create -f file.yaml
```

When you modify the file to apply de change

```sh
kubectl apply -f file.yaml
```

To delete everything that the file has created

```sh
kubectl delete -f file.yaml
```
