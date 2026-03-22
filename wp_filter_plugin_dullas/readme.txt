=== Dulas Filter ===
Contributors:       seniordeveloper
Tags:               filter, ajax, custom post type, taxonomy, shortcode
Requires at least:  5.9
Tested up to:       6.7
Requires PHP:       7.4
Stable tag:         1.1.0
License:            GPL-2.0-or-later
License URI:        https://www.gnu.org/licenses/gpl-2.0.html

Filter the "dulas" custom post type by its taxonomies using AJAX. Drop in with a shortcode.

== Description ==

Dulas Filter provides a clean, accessible filter form for the **dulas** custom post type.
Visitors can narrow results by:

* **Lokācija** (`dulu_lokacija`) — dropdown
* **Statuss** (`statuss`) — dropdown
* **Pakalpojumi** (`dulu_pakalpojums`) — pill-style checkboxes (AND logic — all selected services must match)

Results update via AJAX without a full page reload, with a loading spinner, pagination, and a polished card grid layout.

= Usage =

Place the shortcode anywhere on a page or post:

    [dulas_filter]

Optional attributes:

| Attribute        | Default | Description                            |
| ---------------- | ------- | -------------------------------------- |
| `posts_per_page` | `12`    | Number of posts per page               |
| `orderby`        | `date`  | WP_Query orderby value (date, title …) |
| `order`          | `DESC`  | `ASC` or `DESC`                        |

Example:

    [dulas_filter posts_per_page="9" orderby="title" order="ASC"]

= Requirements =

* The **dulas** custom post type must be registered (by your theme or another plugin).
* The following taxonomies must be registered and associated with the **dulas** post type:
  * `dulu_lokacija`
  * `dulu_pakalpojums`
  * `statuss`

== Installation ==

1. Upload the `dulas-filter` folder to the `/wp-content/plugins/` directory, **or** install via
   **Plugins → Add New → Upload Plugin** in the WordPress admin.
2. Activate the plugin through the **Plugins** menu.
3. Add `[dulas_filter]` to any page or post using the block editor or classic editor.

== Frequently Asked Questions ==

= Does it work with any theme? =

Yes. The plugin enqueues its own stylesheet and does not depend on any specific theme.

= Do I need to register the post type and taxonomies myself? =

Yes. This plugin only handles the filtering UI and AJAX logic. The `dulas` post type and its
taxonomies (`dulu_lokacija`, `dulu_pakalpojums`, `statuss`) must already be registered.

= Can I display multiple filter widgets on the same page? =

Yes. Each `[dulas_filter]` shortcode instance runs independently.

= How does the Pakalpojumi AND logic work? =

When more than one pakalpojums term is checked, only posts that have **all** selected terms
assigned will appear. This is stricter than OR/IN logic where any match would qualify.

== Changelog ==

= 1.1.0 =
* Layout, design, and AJAX filter fixes.

= 1.0.0 =
* Initial release.

== Upgrade Notice ==

= 1.0.0 =
Initial release.
