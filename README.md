## Docker folding@home conatiner

Debian stretch imagine with folding at home set to run as part of the containers team. You can override this by adding the flags:

```
--user=YOUR_NAME --team=TEAM_NUMBER --gpu=false --smp=true
```

Currently COVID19 is taking prioroty so its a great cause that we all need right now.

To run simply type:

```
docker run -d -p7396:7396 richarvey/foldingathome:latest
```

You can get to the webUI on [http://localhost:7396](http://localhost:7396)
