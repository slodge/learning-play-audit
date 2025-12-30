FROM public.ecr.aws/lambda/nodejs:22

# Need full dnf to do groupinstall
RUN dnf remove -y microdnf-dnf && \
  microdnf install -y dnf

# Libraries needed for sharp
RUN dnf -y update \
&& dnf -y groupinstall "Development Tools" \
&& dnf install -y gcc-c++ cairo-devel libjpeg-turbo-devel pango-devel giflib-devel zlib-devel librsvg2-devel

# File structure to run build within docker image
RUN mkdir ${LAMBDA_TASK_ROOT}/fonts
RUN mkdir ${LAMBDA_TASK_ROOT}/src
RUN mkdir ${LAMBDA_TASK_ROOT}/survey
COPY package.json package-lock.json ${LAMBDA_TASK_ROOT}/
COPY src ${LAMBDA_TASK_ROOT}/src
COPY fonts ${LAMBDA_TASK_ROOT}/fonts
COPY survey ${LAMBDA_TASK_ROOT}/survey

# Install NPM dependencies for function - will also create correct binaries for canvas and sharp
RUN npm install

ENV LD_PRELOAD='/var/task/node_modules/canvas/build/Release/libz.so.1'
ENV FONTCONFIG_PATH='/var/task/fonts'

# expose 8080 for debug convenience
EXPOSE 8080

RUN cd ${LAMBDA_TASK_ROOT}
RUN npm run build

# echo the "LAMBDA_TASK_ROOT is <value>" variable
RUN echo "LAMBDA_TASK_ROOT is ${LAMBDA_TASK_ROOT}"
RUN echo "Port is 8080"

#COPY dist/index.js ${LAMBDA_TASK_ROOT}

# Lambda handler function to invoke
CMD [ "dist/index.handler" ]
