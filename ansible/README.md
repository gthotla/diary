# Production VM configuration

The Ansible playbook provisions the Azure VM once or when server configuration changes. It installs Docker, Docker Compose, Nginx, and Certbot, creates the application directory, and configures the API and Grafana reverse proxies.

Copy the example inventory, replace the host address, and run:

```bash
ansible-playbook -i inventory.ini --private-key ~/.ssh/diary_vm ansible/site.yml
```

After DNS points `diary-api.sineops.app` and `diary-grafana.sineops.app` to the VM, issue certificates once:

```bash
sudo certbot --nginx -d diary-api.sineops.app -d diary-grafana.sineops.app
```

Normal application deployments do not run Ansible. They only pull and restart the backend image.
