FROM debian:bullseye-slim

ENV FAH_MINOR=21
ENV FAH_MAJOR=7.6

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install --no-install-recommends -y \
        curl adduser bzip2 dh-python &&\
	curl --insecure https://download.foldingathome.org/releases/public/release/fahclient/debian-stable-64bit/v${FAH_MAJOR}/fahclient_${FAH_MAJOR}.${FAH_MINOR}_amd64.deb > /tmp/fah.deb &&\
        mkdir -p /etc/fahclient/ &&\
        touch /etc/fahclient/config.xml &&\
        dpkg -i --force-depends /tmp/fah.deb &&\
        #dpkg -i --force-depends /tmp/fah-control.deb &&\
        apt-get remove -y curl &&\
        apt-get autoremove -y &&\
        rm --recursive --verbose --force /tmp/* /var/log/* /var/lib/apt/

EXPOSE 7396 36330

ENTRYPOINT ["FAHClient", "--web-allow=0/0:7396", "--allow=0/0:7396"]
CMD ["--user=Anonymous", "--team=240110", "--gpu=false", "--smp=true", "--power=full"]
