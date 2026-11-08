# Production VM configuration

The Ansible playbook provisions the Azure VM once or when server configuration changes. It installs Docker, Docker Compose, Nginx, Certbot, and Fail2ban, creates the application directory, and configures the API and Grafana reverse proxies.

Nginx hardening: `server_tokens off`, a `default_server` catch-all returning `444`, and `444` drops for scanner paths (wp-/wordpress/xmlrpc/phpmyadmin/.env/.git/*/.php etc.) so bots never reach Node. Scanner hits are logged to `/var/log/nginx/scanners.log`. Fail2ban jail `nginx-scanners` bans IPs with 5 hits in 10 min for 1h.

Copy the example inventory, replace the host address, and run:

```bash
ansible-playbook -i inventory.ini --private-key ~/.ssh/diary_vm ansible/site.yml
```

After DNS points `diary-api.sineops.app` and `diary-grafana.sineops.app` to the VM, issue certificates once:

```bash
sudo certbot --nginx -d diary-api.sineops.app -d diary-grafana.sineops.app
```

Normal application deployments do not run Ansible. They only pull and restart the backend image.

Verify after applying:

```bash
sudo nginx -t && sudo systemctl reload nginx
sudo fail2ban-client status nginx-scanners
curl -I http://diary-api.sineops.app/wp-login.php  # expect: connection closed, no response (444)
curl -I https://diary-api.sineops.app/api/health   # expect: 200
```
