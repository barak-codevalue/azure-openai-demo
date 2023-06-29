# Azure OpenAI Demo

This repository is a demonstration of how to use the Azure OpenAI service. It's a proof of concept (POC) and is not ready for production use. The project uses an NX workspace with Angular and Azure function.

## Prerequisites

Before you can run this project, you will need to create an Azure OpenAI service and an Azure Speech service. You will also need to deploy a GPT-3.5-turbo model on the Azure OpenAI service.

## Setup

1. Create an Azure OpenAI service and an Azure Speech service.
2. Deploy a GPT-3.5-turbo model on the Azure OpenAI service.
3. Copy the keys for these services.
4. Paste the keys into the `local.settings.json` file in the project.

## Running the Project

Once you have completed the setup, you can run the project using the following commands:
```
npx nx run backend-func-app:build
npx nx run backend-func-app:serve
```
```
npx nx run client-app:serve
```

## Disclaimer

This project is a demonstration and is not intended for production use. It is provided as-is, and no warranty is given. Use at your own risk.

## License

This project is licensed under the terms of the MIT license.
