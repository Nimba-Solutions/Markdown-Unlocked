<img width="1104" height="333" alt="image" src="https://github.com/user-attachments/assets/8183c0f1-3954-415a-8da5-63669563be6f" />

# Markdown-Unlocked

Markdown Unlocked is a Salesforce Unlocked Package that integrates marked.js with Salesforce. Perfect for documentation and rich text formatting, it brings the power and flexibility of markdown directly to your Salesforce org with easy installation and lightweight, extensible, design.

> In the age of AI where complex codebases are refactored in minutes by sophisticated agents - you gave us a utility that tells us: “yes, that is indeed a bulletpoint.”
>
> ~ with love, 
> CP


## Features

- Seamless integration of marked.js with Salesforce Lightning Web Components
- Support for GitHub Flavored Markdown (GFM)
- Automatic line breaks for better readability
- Robust error handling and logging
- Lightweight and performant implementation
- Easy to use and extend

## Implementation Details

The package consists of two main Lightning Web Components:

1. `markdownRenderer`: The core component that handles markdown rendering
   - Dynamically loads the marked.js library
   - Supports all standard markdown syntax
   - Configurable rendering options
   - Built-in error handling and fallback display

2. `logger`: A utility component for consistent logging across the application
   - Debug, info, warning, and error level logging
   - Detailed error tracking and reporting
   - Helps with troubleshooting and maintenance

## Usage

To use the markdown renderer in your Lightning Web Components, simply pass a markdown string into `markdown-content` slot:

```html
<template>
    <c-markdown-renderer markdown-content={markdownContent}></c-markdown-renderer>
</template>
```

## Development

To work on this project in a scratch org:

1. [Set up CumulusCI](https://cumulusci.readthedocs.io/en/latest/tutorial.html)
2. Run `cci flow run dev_org --org dev` to deploy this project.
3. Run `cci org browser dev` to open the org in your browser.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.
