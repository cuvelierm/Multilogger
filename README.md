# Multilogger

An Express middleware for better monitoring of your Node.js apps.
Parse important req, res and header objects to your database of choice. Get an easier insight of your API without any costs.

## Usage

This npm package uses a dependency on response-time

```
app.use(responseTime());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(multilogger({extended: false, development: false, interval: 5000}));
```

### Parameters

1. Extended: Logs a pretty view of req, res and headers (default false)
2. Development: If you want extra logs of the newly created object (default false)
3. Database: Soon
4. Interval: Defines the rate in ms of the interval you want to write your data to your database


## Dependencies

*   response-time
*   express
*   Node.js