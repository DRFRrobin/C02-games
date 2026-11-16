<?php
/**
 * Plugin Name: C02 Jeux
 * Plugin URI: https://github.com/DRFRrobin/C02-games
 * Description: Affiche les jeux de la C02 Team avec le shortcode [c02_jeux]. La liste se met à jour toute seule quand un jeu est ajouté au dépôt.
 * Version: 1.1.0
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
