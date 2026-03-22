<?php
/**
 * Plugin Name:       Dulas Filter
 * Description:       Filter the "dulas" custom post type by taxonomy using AJAX. Use shortcode [dulas_filter].
 * Version:           1.1.0
 * Requires at least: 5.9
 * Requires PHP:      7.4
 * Author:            Arturs Juhnevics (vibed)
 * Text Domain:       dulas-filter
 * Domain Path:       /languages
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 */

defined( 'ABSPATH' ) || exit;

define( 'DULAS_FILTER_VERSION', '1.1.0' );
define( 'DULAS_FILTER_DIR', plugin_dir_path( __FILE__ ) );
define( 'DULAS_FILTER_URL', plugin_dir_url( __FILE__ ) );

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

add_action( 'wp_enqueue_scripts', 'dulas_filter_enqueue_assets' );
function dulas_filter_enqueue_assets(): void {
	wp_register_style(
		'dulas-filter',
		DULAS_FILTER_URL . 'assets/css/dulas-filter.css',
		[],
		DULAS_FILTER_VERSION
	);

	wp_register_script(
		'dulas-filter',
		DULAS_FILTER_URL . 'assets/js/dulas-filter.js',
		[ 'jquery' ],
		DULAS_FILTER_VERSION,
		true
	);

	wp_localize_script( 'dulas-filter', 'DulasFilter', [
		'ajax_url' => admin_url( 'admin-ajax.php' ),
		'nonce'    => wp_create_nonce( 'dulas_filter_nonce' ),
		'i18n'     => [
			'loading'  => __( 'Loading…', 'dulas-filter' ),
			'no_posts' => __( 'No results found.', 'dulas-filter' ),
			'error'    => __( 'Something went wrong. Please try again.', 'dulas-filter' ),
		],
	] );
}

// ---------------------------------------------------------------------------
// Shortcode
// ---------------------------------------------------------------------------

add_shortcode( 'dulas_filter', 'dulas_filter_shortcode' );
function dulas_filter_shortcode( array $atts = [] ): string {
	$atts = shortcode_atts(
		[
			'posts_per_page' => 12,
			'orderby'        => 'date',
			'order'          => 'DESC',
		],
		$atts,
		'dulas_filter'
	);

	wp_enqueue_style( 'dulas-filter' );
	wp_enqueue_script( 'dulas-filter' );

	ob_start();
	dulas_filter_render_form( $atts );
	return ob_get_clean();
}

// ---------------------------------------------------------------------------
// Render filter form + results wrapper
// ---------------------------------------------------------------------------

function dulas_filter_render_form( array $atts ): void {
	$lokacija_terms    = dulas_filter_get_terms( 'dulu_lokacija' );
	$pakalpojums_terms = dulas_filter_get_terms( 'dulu_pakalpojums' );
	$statuss_terms     = dulas_filter_get_terms( 'statuss' );

	$config = wp_json_encode( [
		'posts_per_page' => (int) $atts['posts_per_page'],
		'orderby'        => sanitize_key( $atts['orderby'] ),
		'order'          => in_array( strtoupper( $atts['order'] ), [ 'ASC', 'DESC' ], true ) ? strtoupper( $atts['order'] ) : 'DESC',
	] );
	?>
	<div class="dulas-filter-wrap" data-config="<?php echo esc_attr( $config ); ?>">

		<!-- Sidebar -->
		<aside class="dulas-filter-sidebar">

			<div class="dulas-filter-sidebar__head">
				<span class="dulas-filter-sidebar__title">
					<?php esc_html_e( 'Filtri', 'dulas-filter' ); ?>
				</span>
				<button type="button" class="dulas-filter-clear" hidden>
					<?php esc_html_e( 'Notīrīt', 'dulas-filter' ); ?>
				</button>
			</div>

			<form class="dulas-filter-form" novalidate>

				<div class="dulas-filter-field">
					<label class="dulas-filter-label" for="dulas-lokacija">
						<?php esc_html_e( 'Lokācija', 'dulas-filter' ); ?>
					</label>
					<div class="dulas-filter-select-wrap">
						<select id="dulas-lokacija" name="dulu_lokacija" class="dulas-filter-select">
							<option value=""><?php esc_html_e( 'Visas', 'dulas-filter' ); ?></option>
							<?php foreach ( $lokacija_terms as $term ) : ?>
								<option value="<?php echo esc_attr( $term->slug ); ?>">
									<?php echo esc_html( $term->name ); ?>
								</option>
							<?php endforeach; ?>
						</select>
					</div>
				</div>

				<div class="dulas-filter-field">
					<label class="dulas-filter-label" for="dulas-statuss">
						<?php esc_html_e( 'Statuss', 'dulas-filter' ); ?>
					</label>
					<div class="dulas-filter-select-wrap">
						<select id="dulas-statuss" name="statuss" class="dulas-filter-select">
							<option value=""><?php esc_html_e( 'Visi', 'dulas-filter' ); ?></option>
							<?php foreach ( $statuss_terms as $term ) : ?>
								<option value="<?php echo esc_attr( $term->slug ); ?>">
									<?php echo esc_html( $term->name ); ?>
								</option>
							<?php endforeach; ?>
						</select>
					</div>
				</div>

				<?php if ( $pakalpojums_terms ) : ?>
				<div class="dulas-filter-field">
					<span class="dulas-filter-label">
						<?php esc_html_e( 'Pakalpojumi', 'dulas-filter' ); ?>
					</span>
					<div class="dulas-filter-checkboxes">
						<?php foreach ( $pakalpojums_terms as $term ) : ?>
							<label class="dulas-filter-checkbox-label">
								<input
									type="checkbox"
									name="dulu_pakalpojums[]"
									value="<?php echo esc_attr( $term->slug ); ?>"
									class="dulas-filter-checkbox"
								>
								<span class="dulas-filter-checkbox-text">
									<?php echo esc_html( $term->name ); ?>
								</span>
							</label>
						<?php endforeach; ?>
					</div>
				</div>
				<?php endif; ?>

			</form>

		</aside><!-- .dulas-filter-sidebar -->

		<!-- Main / Results -->
		<div class="dulas-filter-main">
			<div class="dulas-filter-results" aria-live="polite" aria-atomic="true">
				<?php dulas_filter_render_posts( $atts ); ?>
			</div>
		</div>

	</div><!-- .dulas-filter-wrap -->
	<?php
}

// ---------------------------------------------------------------------------
// Render posts grid (initial load + AJAX response)
// ---------------------------------------------------------------------------

function dulas_filter_render_posts( array $args, array $tax_query = [] ): void {
	$query_args = [
		'post_type'      => 'dulas',
		'post_status'    => 'publish',
		'posts_per_page' => (int) $args['posts_per_page'],
		'orderby'        => sanitize_key( $args['orderby'] ),
		'order'          => in_array( strtoupper( $args['order'] ), [ 'ASC', 'DESC' ], true ) ? strtoupper( $args['order'] ) : 'DESC',
		'paged'          => max( 1, (int) ( $args['paged'] ?? 1 ) ),
	];

	if ( ! empty( $tax_query ) ) {
		$query_args['tax_query'] = $tax_query; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
	}

	$query = new WP_Query( $query_args );

	if ( ! $query->have_posts() ) {
		echo '<p class="dulas-filter-no-results">' . esc_html__( 'No results found.', 'dulas-filter' ) . '</p>';
		wp_reset_postdata();
		return;
	}

	echo '<div class="dulas-filter-grid">';
	while ( $query->have_posts() ) {
		$query->the_post();
		dulas_filter_render_card();
	}
	echo '</div>';

	// Pagination
	if ( $query->max_num_pages > 1 ) {
		dulas_filter_render_pagination( $query->max_num_pages, (int) ( $args['paged'] ?? 1 ) );
	}

	wp_reset_postdata();
}

// ---------------------------------------------------------------------------
// Single post card
// ---------------------------------------------------------------------------

function dulas_filter_render_card(): void {
	$lokacija  = get_the_terms( get_the_ID(), 'dulu_lokacija' );
	$statuss   = get_the_terms( get_the_ID(), 'statuss' );
	$permalink = get_permalink();
	$thumb     = has_post_thumbnail() ? get_the_post_thumbnail_url( get_the_ID(), 'large' ) : '';
	?>
	<article class="dulas-card">
		<a href="<?php echo esc_url( $permalink ); ?>" class="dulas-card__thumb-link" tabindex="-1" aria-hidden="true">
			<div class="dulas-card__thumb<?php echo $thumb ? '' : ' dulas-card__thumb--empty'; ?>"<?php echo $thumb ? ' style="background-image:url(\'' . esc_url( $thumb ) . '\')"' : ''; ?>></div>
		</a>

		<div class="dulas-card__body">

			<?php if ( ! is_wp_error( $statuss ) && $statuss ) : ?>
				<span class="dulas-card__badge"><?php echo esc_html( $statuss[0]->name ); ?></span>
			<?php endif; ?>

			<h3 class="dulas-card__title">
				<a href="<?php echo esc_url( $permalink ); ?>"><?php the_title(); ?></a>
			</h3>

			<?php if ( ! is_wp_error( $lokacija ) && $lokacija ) : ?>
				<p class="dulas-card__meta">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
					<?php echo esc_html( $lokacija[0]->name ); ?>
				</p>
			<?php endif; ?>

			<a href="<?php echo esc_url( $permalink ); ?>" class="dulas-card__link">
				<?php esc_html_e( 'Skatīt profilu', 'dulas-filter' ); ?>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
			</a>

		</div><!-- .dulas-card__body -->
	</article>
	<?php
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

function dulas_filter_render_pagination( int $total_pages, int $current_page ): void {
	echo '<nav class="dulas-filter-pagination" aria-label="' . esc_attr__( 'Results pagination', 'dulas-filter' ) . '">';
	for ( $i = 1; $i <= $total_pages; $i++ ) {
		$active = $i === $current_page ? ' dulas-filter-page--active' : '';
		printf(
			'<button class="dulas-filter-page%s" data-page="%d" aria-label="%s" %s>%d</button>',
			esc_attr( $active ),
			$i,
			esc_attr( sprintf( __( 'Page %d', 'dulas-filter' ), $i ) ),
			( $i === $current_page ? 'aria-current="page"' : '' ),
			$i
		);
	}
	echo '</nav>';
}

// ---------------------------------------------------------------------------
// AJAX handler
// ---------------------------------------------------------------------------

add_action( 'wp_ajax_dulas_filter_query', 'dulas_filter_ajax_handler' );
add_action( 'wp_ajax_nopriv_dulas_filter_query', 'dulas_filter_ajax_handler' );
function dulas_filter_ajax_handler(): void {
	check_ajax_referer( 'dulas_filter_nonce', 'nonce' );

	// --- Build tax_query ---
	$tax_query = [ 'relation' => 'AND' ];
	$has_tax   = false;

	$lokacija = sanitize_text_field( wp_unslash( $_POST['dulu_lokacija'] ?? '' ) );
	if ( $lokacija ) {
		$tax_query[] = [
			'taxonomy' => 'dulu_lokacija',
			'field'    => 'slug',
			'terms'    => $lokacija,
		];
		$has_tax = true;
	}

	$statuss = sanitize_text_field( wp_unslash( $_POST['statuss'] ?? '' ) );
	if ( $statuss ) {
		$tax_query[] = [
			'taxonomy' => 'statuss',
			'field'    => 'slug',
			'terms'    => $statuss,
		];
		$has_tax = true;
	}

	// Pakalpojumi (array of slugs from checkboxes)
	$pakalpojumi_raw = isset( $_POST['dulu_pakalpojums'] ) && is_array( $_POST['dulu_pakalpojums'] )
		? array_map( 'sanitize_text_field', wp_unslash( $_POST['dulu_pakalpojums'] ) )
		: [];

	if ( ! empty( $pakalpojumi_raw ) ) {
		$tax_query[] = [
			'taxonomy' => 'dulu_pakalpojums',
			'field'    => 'slug',
			'terms'    => $pakalpojumi_raw,
			'operator' => 'AND',
		];
		$has_tax = true;
	}

	// --- Config passed from JS ---
	$posts_per_page = max( 1, min( 100, (int) ( $_POST['posts_per_page'] ?? 12 ) ) );
	$orderby        = sanitize_key( $_POST['orderby'] ?? 'date' );
	$order          = in_array( strtoupper( $_POST['order'] ?? 'DESC' ), [ 'ASC', 'DESC' ], true ) ? strtoupper( $_POST['order'] ) : 'DESC';
	$paged          = max( 1, (int) ( $_POST['paged'] ?? 1 ) );

	ob_start();
	dulas_filter_render_posts(
		[
			'posts_per_page' => $posts_per_page,
			'orderby'        => $orderby,
			'order'          => $order,
			'paged'          => $paged,
		],
		$has_tax ? $tax_query : []
	);
	$html = ob_get_clean();

	wp_send_json_success( [ 'html' => $html ] );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function dulas_filter_get_terms( string $taxonomy ): array {
	$terms = get_terms( [
		'taxonomy'   => $taxonomy,
		'hide_empty' => true,
		'orderby'    => 'name',
		'order'      => 'ASC',
	] );

	return ( is_wp_error( $terms ) || empty( $terms ) ) ? [] : $terms;
}
