# TEDxAJCE 2024 Registration Verification

This repository contains the source code for the TEDxAJCE 2024 event registration verification.

## Project Structure

- `.github/`: Contains workflows for GitHub Actions.
- `public/`: Contains the public-facing HTML, CSS, and JavaScript files for the website.

## Deployment

The website is deployed to Firebase Hosting. Deployment is handled automatically by GitHub Actions:

- Pull requests trigger the [`Deploy to Firebase Hosting on PR`](.github/workflows/firebase-hosting-pull-request.yml) workflow.
- Merges to the `main` branch trigger the [`Deploy to Firebase Hosting on merge`](.github/workflows/firebase-hosting-merge.yml) workflow.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.