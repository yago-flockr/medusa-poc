# Connecting your Shopify store

This connects your Shopify store to our marketplace automatically. Run each command below one at a time — paste it, press Enter, wait for it to finish, then move to the next one.

**Step 1.** Installs Shopify's command-line tool.

```
npm install -g @shopify/cli@latest
```

**Step 2.** Creates the app and asks which organization/store to use — pick the one shown.

```
shopify app init --name our-marketplace-sync --template none
```

**Step 3.** Moves into the folder the last command created.

```
cd our-marketplace-sync
```

**Step 4.** Removes demo files we don't need.

```
rm -rf extensions shared
```

**Step 5.** Turns on the access mode we need. (No output means it worked)

```
sed -i 's/direct_api_mode = "online"/direct_api_mode = "offline"/' shopify.app.toml
```

**Step 6.** Limits the app to only see products and stock. (No output means it worked)

```
sed -i 's/scopes = "write_products"/scopes = "read_products,read_inventory"/' shopify.app.toml
```

**Step 7.** Removes an unrelated demo feature that would otherwise block the next step. (No output means it worked)

```
sed -i '/^\[metaobjects.app.faq\]/,$d' shopify.app.toml
```

**Step 8.** Registers the app with Shopify and prints a link you'll need for Step 9.

```
shopify app deploy --allow-updates
```

**Step 9.** Open the link Step 8 printed (starts with `https://dev.shopify.com/dashboard/...`). This makes the app installable on your store and installs it.

1. Click **Distribution**
2. Click **Custom distribution**
3. Click **Install app**

**Step 10.** Prints your connection details.

```
shopify app env show
```

**Step 11.** Copy everything Step 10 printed and send it to us — insert your onboarding contact here: **[ONBOARDING_CONTACT]**.

That's it — nothing else to do on your side.
