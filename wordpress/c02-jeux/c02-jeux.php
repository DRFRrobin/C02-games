<?php
/**
 * Plugin Name: C02 Jeux
 * Plugin URI: https://github.com/DRFRrobin/C02-games
 * Update URI: https://github.com/DRFRrobin/C02-games
 * Description: Affiche les jeux de la C02 Team avec le shortcode [c02_jeux]. La liste se met à jour toute seule quand un jeu est ajouté au dépôt.
 * Version: 1.2.0
 * Author: DRFRrobin
 * License: MIT
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Adresse du site des jeux (GitHub Pages). Peut être redéfinie dans wp-config.php
// ou par l'attribut url="" du shortcode.
if ( ! defined( 'C02_JEUX_URL' ) ) {
	define( 'C02_JEUX_URL', defined( 'MINI_JEUX_URL' ) ? MINI_JEUX_URL : 'https://drfrrobin.github.io/C02-games/' );
}

// Dépôt GitHub d'où viennent les mises à jour du plugin.
if ( ! defined( 'C02_JEUX_REPO' ) ) {
	define( 'C02_JEUX_REPO', 'DRFRrobin/C02-games' );
}

/**
 * Shortcode [c02_jeux] (l'ancien nom [mini_jeux] fonctionne aussi).
 *
 * Attributs :
 *   url        adresse du site des jeux (défaut : C02_JEUX_URL)
 *   colonnes   nombre de colonnes fixe (défaut : automatique)
 *   ouverture  "onglet" (défaut) ou "meme"
 */
function c02_jeux_shortcode( $atts, $content = '', $tag = 'c02_jeux' ) {
	$atts = shortcode_atts(
		array(
			'url'       => C02_JEUX_URL,
			'colonnes'  => '',
			'ouverture' => 'onglet',
		),
		$atts,
		$tag
	);

	$base = trailingslashit( esc_url_raw( $atts['url'] ) );
	if ( '/' === $base ) {
		return '';
	}

	wp_enqueue_script( 'c02-jeux-embed', $base . 'embed.js', array(), null, true );

	$html = '<div data-mini-jeux';
	if ( absint( $atts['colonnes'] ) > 0 ) {
		$html .= ' data-colonnes="' . absint( $atts['colonnes'] ) . '"';
	}
	if ( 'meme' === $atts['ouverture'] ) {
		$html .= ' data-ouverture="meme"';
	}
	$html .= '></div>';

	return $html;
}
add_shortcode( 'c02_jeux', 'c02_jeux_shortcode' );
add_shortcode( 'mini_jeux', 'c02_jeux_shortcode' );

/* ---------------------------------------------------------------------------
 * Mise à jour automatique : WordPress compare la version installée avec la
 * dernière GitHub Release du dépôt. Si une version plus récente existe, elle
 * apparaît dans Extensions → Mises à jour, comme les autres plugins.
 * ------------------------------------------------------------------------ */

function c02_jeux_version() {
	$data = get_file_data( __FILE__, array( 'Version' => 'Version' ) );
	return $data['Version'];
}

/**
 * Dernière release du dépôt, avec son zip. Résultat mis en cache :
 * 12 h si tout va bien, 1 h en cas d'erreur (pour ne pas bloquer l'API GitHub).
 *
 * @return array|null { version, url, package } ou null.
 */
function c02_jeux_latest_release() {
	$cache = get_transient( 'c02_jeux_latest_release' );
	if ( false !== $cache ) {
		return $cache ? $cache : null;
	}

	$release  = array();
	$response = wp_remote_get(
		'https://api.github.com/repos/' . C02_JEUX_REPO . '/releases/latest',
		array(
			'timeout' => 10,
			'headers' => array(
				'Accept'     => 'application/vnd.github+json',
				'User-Agent' => 'C02-Jeux-WordPress-Plugin',
			),
		)
	);

	if ( ! is_wp_error( $response ) && 200 === wp_remote_retrieve_response_code( $response ) ) {
		$json   = json_decode( wp_remote_retrieve_body( $response ), true );
		$assets = ( is_array( $json ) && isset( $json['assets'] ) && is_array( $json['assets'] ) ) ? $json['assets'] : array();

		if ( is_array( $json ) && ! empty( $json['tag_name'] ) ) {
			foreach ( $assets as $asset ) {
				if ( isset( $asset['name'], $asset['browser_download_url'] ) && 'c02-jeux.zip' === $asset['name'] ) {
					$release = array(
						'version' => ltrim( $json['tag_name'], 'vV' ),
						'url'     => isset( $json['html_url'] ) ? $json['html_url'] : '',
						'package' => $asset['browser_download_url'],
					);
					break;
				}
			}
		}
	}

	set_transient( 'c02_jeux_latest_release', $release, $release ? 12 * HOUR_IN_SECONDS : HOUR_IN_SECONDS );

	return $release ? $release : null;
}

/**
 * Ajoute le plugin à la liste des mises à jour s'il existe une version plus récente.
 */
function c02_jeux_check_update( $transient ) {
	if ( empty( $transient->checked ) ) {
		return $transient;
	}

	$basename = plugin_basename( __FILE__ );
	if ( ! isset( $transient->checked[ $basename ] ) ) {
		return $transient;
	}

	$release = c02_jeux_latest_release();
	if ( $release && version_compare( $release['version'], c02_jeux_version(), '>' ) ) {
		$transient->response[ $basename ] = (object) array(
			'slug'        => 'c02-jeux',
			'plugin'      => $basename,
			'new_version' => $release['version'],
			'url'         => $release['url'],
			'package'     => $release['package'],
		);
	}

	return $transient;
}
add_filter( 'pre_set_site_transient_update_plugins', 'c02_jeux_check_update' );
