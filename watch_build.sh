watchmedo shell-command \
    --patterns="*" \
    --recursive \
    --command='python3.4 build.py' \
    --wait \
    .
