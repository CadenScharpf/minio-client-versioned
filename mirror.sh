#CMD node --inspect-brk=0.0.0.0:3251 index.js $ENV

node --inspect-brk=0.0.0.0:3251 index.js mirror \
         --source=aws --target=minio -vc \
         -b \
            bucket-one \
            bucket-two \
            bucket-three 