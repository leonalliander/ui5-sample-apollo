sap.ui.define([
	"sap/ui/core/UIComponent",
	"apollo/client/thirdparty/apollo",
	"sap/ui/core/ComponentSupport"
], function(UIComponent, UI5Apollo) {
	"use strict";

	const {
		ApolloClient,
		InMemoryCache,
		HttpLink,
		WebSocketLink,
		split,
		getMainDefinition
	} = UI5Apollo;

	return UIComponent.extend("sap.ui.demo.todo.Component", {
		metadata: {
			manifest: "json"
		},
		createContent: function() {
			const httpLink = new HttpLink({
				uri: this.getMetadata().getManifestEntry("/sap.app/dataSources/graphql/uri")
			});

			const wsLink = new WebSocketLink({
				uri: this.getMetadata().getManifestEntry("/sap.app/dataSources/graphql/ws"),
				options: {
					reconnect: true
				}
			});

			const link = split(
				// split based on operation type
				({ query }) => {
					const { kind, operation } = getMainDefinition(query);
					return kind === 'OperationDefinition' && operation === 'subscription';
				},
				wsLink,
				httpLink,
			);

			this.apolloClient = new ApolloClient({
				cache: new InMemoryCache(),
				link,
				name: 'ui5-client',
				version: '1.0',
				defaultOptions: {
					watchQuery: { fetchPolicy: 'no-cache' },
					query: { fetchPolicy: 'no-cache' },
					mutate: { fetchPolicy: 'no-cache' }
				}
			});
			return UIComponent.prototype.createContent.apply(this, arguments);
		}
	});
});
