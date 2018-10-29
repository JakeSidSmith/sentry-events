# Sentry Events

**CLI to list Sentry events**

## Setup

Add a Sentry token to the environment that has access to project events.

You could define this in your `.bash_profile` or equivalent:

```
export SENTRY_TOKEN="your-token-here"
```

Or prefix your calls to this library with:

```
SENTRY_TOKEN="you-token-here" sentry-events organization/project
```

## Making requests

Simply call this library with the organization/project in the format "organization/project".

```
sentry-events organization/project
```

## Storing data

You can put the output into a file with bash:


```
sentry-events organization/project > output.json
```

## Filtering data

I'd recommend using the [jq](https://stedolan.github.io/jq/) to filter the output json.

To list all referers you can filter with jq like so:

```
cat output.json | jq '.events[].entries[].data.headers[]? | select(.[0] == "Referer")[1]'
```

Or you could construct your own object containing the error message and the referer:

```
cat output.json | jq '.events[] | select(.entries[].data.headers[]?[0] == "Referer") | {error: .metadata.value, referer: .entries[].data.headers[]? | select(.[0] == "Referer")[1]}'
```
