#!/bin/bash

# Log file for the server
LOG_FILE="/Users/faresfadly/xreviatech-website/server.log"

# Create log file if it doesn't exist
touch "$LOG_FILE"

# Change to the website directory
cd /Users/faresfadly/xreviatech-website

# Function to start the server
start_server() {
    echo "$(date): Starting XreviaTech web server on port 8000..." >> "$LOG_FILE"
    # Start the Python HTTP server and redirect output to log file
    python3 -m http.server 8000 >> "$LOG_FILE" 2>&1
}

# Main loop to restart server if it crashes
while true; do
    # Start the server
    start_server
    
    # If the server exits, log the crash and wait before restarting
    echo "$(date): Server crashed or stopped. Restarting in 5 seconds..." >> "$LOG_FILE"
    sleep 5
done

