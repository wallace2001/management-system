# Base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN yarn prisma generate

# Copy the rest of the application
COPY . .

# Build the NestJS project
RUN yarn build

# Expose the NestJS port
EXPOSE 3000

# Start app
CMD ["yarn", "start:prod"]
