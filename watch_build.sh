watchmedo shell-command \
    --patterns="*" \
    --recursive \
    --command='python3 build.py' \
    --wait \
    .
