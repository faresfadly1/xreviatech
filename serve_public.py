#!/usr/bin/env python3
"""
XreviaTech Website Server

This script starts a local HTTP server that makes the XreviaTech website 
accessible on your local network. Anyone on the same network can access it.
"""

import http.server
import socketserver
import os
import sys
import threading
import time
import logging
import signal
import webbrowser
import socket
from datetime import datetime

# Configuration
PORT = 8000
HOST = "0.0.0.0"  # Listen on all network interfaces
WEBSITE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(WEBSITE_DIR, "server.log")
MAX_REQUEST_SIZE = 1048576  # 1MB max request size
REQUEST_TIMEOUT = 30  # 30 seconds timeout

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("XreviaTech")

# Get local IP addresses
def get_ip_addresses():
    local_ip = "127.0.0.1"
    network_ips = []
    
    try:
        # Get hostname
        hostname = socket.gethostname()
        
        # Get local IP by hostname
        local_ip = socket.gethostbyname(hostname)
        
        # Get all network interfaces
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            # Doesn't need to be reachable
            s.connect(('10.255.255.255', 1))
            network_ip = s.getsockname()[0]
            if network_ip != local_ip:
                network_ips.append(network_ip)
        except Exception:
            pass
        finally:
            s.close()
    except Exception as e:
        logger.warning(f"Error getting IP addresses: {e}")
    
    return local_ip, network_ips

# Custom HTTP request handler with security features
class SecureHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    # Add security headers
    def end_headers(self):
        self.send_header("Server", "XreviaTech-Server")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com;")
        super().end_headers()
    
    # Log all requests
    def log_message(self, format, *args):
        client_addr = self.address_string()
        logger.info(f"Request from {client_addr}: {format % args}")
    
    # Limit request size
    def handle_one_request(self):
        self.request.settimeout(REQUEST_TIMEOUT)
        return super().handle_one_request()
    
    # Don't show directory listings
    def list_directory(self, path):
        # Redirect to index.html instead of showing directory listing
        self.send_response(301)
        self.send_header("Location", "/index.html")
        self.end_headers()
        return None

# Banner display function
def display_banner(local_ip, network_ips):
    banner = """
    ╔══════════════════════════════════════════════════════╗
    ║                                                      ║
    ║   ██╗  ██╗██████╗ ███████╗██╗   ██╗██╗ █████╗       ║
    ║   ╚██╗██╔╝██╔══██╗██╔════╝██║   ██║██║██╔══██╗      ║
    ║    ╚███╔╝ ██████╔╝█████╗  ██║   ██║██║███████║      ║
    ║    ██╔██╗ ██╔══██╗██╔══╝  ╚██╗ ██╔╝██║██╔══██║      ║
    ║   ██╔╝ ██╗██║  ██║███████╗ ╚████╔╝ ██║██║  ██║      ║
    ║   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝  ╚═══╝  ╚═╝╚═╝  ╚═╝      ║
    ║                                         TECH         ║
    ║                                                      ║
    ╚══════════════════════════════════════════════════════╝
    """
    print(banner)
    print("\n    XreviaTech Website Server\n")
    print("    ✅ Server running successfully!")
    print(f"    🖥️  Local access: http://localhost:{PORT}")
    print(f"    🖥️  Computer access: http://{local_ip}:{PORT}")
    
    if network_ips:
        print("\n    📱 Access from other devices on your network:")
        for ip in network_ips:
            print(f"       http://{ip}:{PORT}")
    
    print("\n    📋 INSTRUCTIONS:")
    print("    - Share any of the above URLs with people on your network")
    print("    - They can access the website by entering the URL in their browser")
    print("    - The server will run until you stop it (Ctrl+C)")
    print("    - All requests are logged to server.log")
    print("\n    Press Ctrl+C to stop the server.\n")

# Server class
class NetworkWebServer:
    def __init__(self):
        self.http_server = None
        self.http_thread = None
        self.running = False
        os.chdir(WEBSITE_DIR)
    
    def start_http_server(self):
        """Start the HTTP server in a separate thread"""
        try:
            # Allow server to reuse the address
            socketserver.TCPServer.allow_reuse_address = True
            
            handler = SecureHTTPRequestHandler
            self.http_server = socketserver.TCPServer((HOST, PORT), handler)
            self.http_thread = threading.Thread(target=self.http_server.serve_forever)
            self.http_thread.daemon = True
            self.http_thread.start()
            logger.info(f"HTTP server started on {HOST}:{PORT}")
            return True
        except Exception as e:
            logger.error(f"Failed to start HTTP server: {e}")
            return False
    
    def start(self):
        """Start the HTTP server and display access information"""
        logger.info("Starting XreviaTech network server...")
        
        # Start HTTP server
        if not self.start_http_server():
            logger.error("Server startup failed. Exiting.")
            return False
        
        # Get IP addresses
        local_ip, network_ips = get_ip_addresses()
        
        # Display banner with URLs
        display_banner(local_ip, network_ips)
        
        # Record startup in log
        logger.info(f"XreviaTech website is now accessible on the local network")
        
        # Attempt to open the website in browser
        try:
            webbrowser.open(f"http://localhost:{PORT}")
            logger.info("Opened website in browser")
        except Exception as e:
            logger.warning(f"Could not open browser: {e}")
        
        self.running = True
        return True
    
    def stop(self):
        """Stop the server"""
        logger.info("Shutting down server...")
        
        # Stop HTTP server
        if self.http_server:
            try:
                self.http_server.shutdown()
                self.http_server.server_close()
                logger.info("HTTP server stopped")
            except Exception as e:
                logger.error(f"Error stopping HTTP server: {e}")
        
        # Wait for threads to finish
        if self.http_thread and self.http_thread.is_alive():
            self.http_thread.join(timeout=5)
        
        self.running = False
        logger.info("Server shutdown complete")
        print("\nXreviaTech server has been stopped. Thank you for using our service!")

# Signal handler for graceful shutdown
def signal_handler(sig, frame):
    print("\nShutdown signal received. Closing server...")
    if server and server.running:
        server.stop()
    sys.exit(0)

# Main function
if __name__ == "__main__":
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Start the server
    server = NetworkWebServer()
    try:
        if server.start():
            # Keep the main thread alive
            while server.running:
                time.sleep(1)
        else:
            sys.exit(1)
    except KeyboardInterrupt:
        server.stop()
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        if server:
            server.stop()
        sys.exit(1)

