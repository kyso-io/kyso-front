# Commits convention

https://www.conventionalcommits.org/en/v1.0.0/


# Logging 

Please use the following code snippet

```typescript
Helper.logError(message, error);
```

### Getting started

```shell
npm install
```

Then, you can run locally in development mode with live reload:

```shell
npm run dev
```

Open http://localhost:3000 with your favorite browser to see your project.

```shell
.
├── README.md                       # README file
├── __mocks__                       # Mocks for testing
├── .github                         # GitHub folder
├── .husky                          # Husky configuration
├── .vscode                         # VSCode configuration
├── public                          # Public assets folder
├── src
│   ├── layouts                     # Layouts components
│   ├── pages                       # Next JS Pages
│   ├── pages.test                  # Next JS Pages tests (this avoid test to treated as a Next.js pages)
│   ├── styles                      # Styles folder
│   ├── templates                   # Default template
│   └── utils                       # Utility functions
├── tailwind.config.js              # Tailwind CSS configuration
└── tsconfig.json                   # TypeScript configuration
```

### Customization

You can easily configure. Please change the following file:

- `public/favicon.ico`, `public/favicon-16x16.png` and `public/favicon-32x32.png`: your website favicon, you can generate from https://favicon.io/favicon-converter/
- `src/styles/global.css`: your CSS file using Tailwind CSS
- `src/utils/AppConfig.ts`: configuration file
- `src/templates/Main.tsx`: default theme

### Deploy to production

You can see the results locally in production mode with:

```shell
$ npm run build
$ npm run start
```

The generated HTML and CSS files are minified (built-in feature from Next js). It will also removed unused CSS from [Tailwind CSS](https://tailwindcss.com).

You can create an optimized production build with:

```shell
npm run build-prod
```

### VSCode information (optional)

If you are VSCode users, you can have a better integration with VSCode by installing the suggested extension in `.vscode/extension.json`. The starter code comes up with Settings for a seamless integration with VSCode. The Debug configuration is also provided for frontend and backend debugging experience.

With the plugins installed on your VSCode, ESLint and Prettier can automatically fix the code and show you the errors. Same goes for testing, you can install VSCode Jest extension to automatically run your tests and it also show the code coverage in context.

Pro tips: if you need a project wide type checking with TypeScript, you can run a build with <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> on Mac.

### Kyso button css 
# 1. Primary 
Sample - Create New Report
className:

text-sm
font-small
rounded-md
shadow-sm
text-white 
focus:outline-none
focus:ring-0
border-transparent
border
bg-default-kyso
hover:bg-default-kyso-button-hover
focus:ring-indigo-900
focus:ring-offset-2

px-2 py-1


# 2. Secondary (border)
Usecase:  Cancel
className:

text-sm
font-small
rounded-md
shadow-sm

inline-flex
items-center
focus:outline-none
focus:ring-0

text-gray-500
border border-gray-500
bg-white
hover:bg-gray-100

px-2 py-1

# 3. Tertiary (No border)
Usecase: Edit, reply, load more
className:


text-sm
font-small
rounded-md
text-gray-500
inline-flex
items-center
focus:outline-none
focus:ring-0
border 
border-transparent
bg-white
hover:bg-gray-100

px-2.5 py-1.5

Atention - Delete:
  text-rose-700
  hover:bg-rose-100

### Links
# Black words links
 text-gray-900 hover:text-indigo-600 hover:underline

# Blue links
font-medium text-indigo-600 hover:text-indigo-700 hover:underline