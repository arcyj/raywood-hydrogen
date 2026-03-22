/* global DulasFilter, jQuery */
( function ( $ ) {
	'use strict';

	const DEBOUNCE_MS = 350;

	/**
	 * Dulas Filter Controller
	 */
	const DulasFilterApp = {

		$wrap:    null,
		$form:    null,
		$results: null,
		$clear:   null,
		config:   {},
		xhr:      null,
		_timer:   null,

		init( $wrap ) {
			this.$wrap    = $wrap;
			this.$form    = $wrap.find( '.dulas-filter-form' );
			this.$results = $wrap.find( '.dulas-filter-results' );
			this.$clear   = $wrap.find( '.dulas-filter-clear' );
			this.config   = this.parseConfig();

			this.bindEvents();
		},

		parseConfig() {
			try {
				return JSON.parse( this.$wrap.data( 'config' ) || '{}' );
			} catch {
				return {};
			}
		},

		bindEvents() {
			// Auto-filter on any input change (debounced)
			this.$form.on( 'change', 'select, input[type="checkbox"]', () => {
				this.scheduleQuery();
			} );

			// Clear all filters button
			this.$clear.on( 'click', () => {
				this.$form[ 0 ].reset();
				this.updateClearVisibility();
				this.query( 1 );
			} );

			// Pagination (delegated — works for dynamically rendered buttons)
			this.$results.on( 'click', '.dulas-filter-page', ( e ) => {
				const page = parseInt( $( e.currentTarget ).data( 'page' ), 10 );
				if ( page ) {
					this.query( page );
					this.scrollToResults();
				}
			} );
		},

		scheduleQuery() {
			clearTimeout( this._timer );
			this.updateClearVisibility();
			this._timer = setTimeout( () => this.query( 1 ), DEBOUNCE_MS );
		},

		collectFilters() {
			const filters = {};

			const lokacija = this.$form.find( '[name="dulu_lokacija"]' ).val();
			const statuss  = this.$form.find( '[name="statuss"]' ).val();

			if ( lokacija ) filters.dulu_lokacija = lokacija;
			if ( statuss )  filters.statuss       = statuss;

			const pakalpojumi = this.$form
				.find( '[name="dulu_pakalpojums[]"]:checked' )
				.map( ( _, el ) => el.value )
				.get();

			if ( pakalpojumi.length ) {
				filters.dulu_pakalpojums = pakalpojumi;
			}

			return filters;
		},

		hasActiveFilters() {
			const f = this.collectFilters();
			return Object.keys( f ).length > 0;
		},

		updateClearVisibility() {
			if ( this.hasActiveFilters() ) {
				this.$clear.removeAttr( 'hidden' );
			} else {
				this.$clear.attr( 'hidden', '' );
			}
		},

		query( page = 1 ) {
			if ( this.xhr ) {
				this.xhr.abort();
			}

			const payload = {
				action:         'dulas_filter_query',
				nonce:          DulasFilter.nonce,
				paged:          page,
				posts_per_page: this.config.posts_per_page || 12,
				orderby:        this.config.orderby        || 'date',
				order:          this.config.order          || 'DESC',
				...this.collectFilters(),
			};

			this.setLoading( true );

			this.xhr = $.ajax( {
				url:  DulasFilter.ajax_url,
				type: 'POST',
				data: payload,
			} )
				.done( ( response ) => {
					if ( response.success && response.data && response.data.html ) {
						this.$results.html( response.data.html );
					} else {
						this.$results.html( this.noResultsHtml() );
					}
				} )
				.fail( ( jqXHR ) => {
					if ( jqXHR.statusText === 'abort' ) return;
					this.$results.html( this.errorHtml() );
				} )
				.always( () => {
					this.setLoading( false );
				} );
		},

		setLoading( loading ) {
			if ( loading ) {
				this.$results
					.addClass( 'dulas-filter-results--loading' )
					.html( '<div class="dulas-filter-spinner" role="status" aria-label="' + DulasFilter.i18n.loading + '"></div>' );
			} else {
				this.$results.removeClass( 'dulas-filter-results--loading' );
			}
		},

		noResultsHtml() {
			return '<p class="dulas-filter-no-results">' + this.escHtml( DulasFilter.i18n.no_posts ) + '</p>';
		},

		errorHtml() {
			return '<p class="dulas-filter-no-results">' + this.escHtml( DulasFilter.i18n.error ) + '</p>';
		},

		scrollToResults() {
			const top = this.$results.offset().top - 80;
			$( 'html, body' ).animate( { scrollTop: top }, 380 );
		},

		escHtml( str ) {
			return $( '<div>' ).text( str ).html();
		},
	};

	$( document ).ready( () => {
		$( '.dulas-filter-wrap' ).each( function () {
			Object.create( DulasFilterApp ).init( $( this ) );
		} );
	} );

} )( jQuery );
