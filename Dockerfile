#This is a comment
FROM centos:centos6
MAINTAINER Theeraphol Wattanavekin <teerapol.watanavekin@mail.rakuten.com>
# Basic packages for work & troubleshooting
RUN   yum update -y && yum install -y \
      git \
      vim \
      zsh \
      tar
RUN   rpm -Uvh http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
# Package for app
RUN   yum install -y \
      npm \
      nodejs
# ENV for awesomeinventory version for easy bump up version
ENV APP_VERSION 0.2.4-1
ENV APP_NAME trunks
ENV FULLNAME $APP_NAME-$APP_VERSION
# Install
COPY $FULLNAME.tar.gz /tmp/
## make folder and change permission
RUN mkdir -p /opt/ \
    && tar -xzvf /tmp/$FULLNAME.tar.gz -C /opt \
    && cd /opt/$FULLNAME \
    && npm install
# Add sails & forever & bower path
RUN ln -s /opt/$FULLNAME/node_modules/sails/bin/sails.js /usr/local/bin/sails
RUN ln -s /opt/$FULLNAME/node_modules/bower/bin/bower /usr/local/bin/bower
RUN ln -s /opt/$FULLNAME/node_modules/forever/bin/forever /usr/local/bin/forever
# Install frontend dependencies
RUN cd /opt/$FULLNAME \
    && bower --allow-root install
# Configure awesomeinventory
COPY  local.js /opt/$FULLNAME/config/
# PORT EXPOSE
EXPOSE 1337

WORKDIR /opt/$FULLNAME
CMD ["sails", "lift"]
