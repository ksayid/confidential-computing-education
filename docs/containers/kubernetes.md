---
title: Kubernetes
layout: default
---

[← Back to Main Page]({{ "/" | relative_url }})

* TOC
{:toc}


https://eksclustergames.com/challenge/2
https://www.youtube.com/watch?v=Ki1J2pxAHdQ&list=PLBexUsYDijawgCdEqEDBj3cUCovUS1MM5&index=4
https://www.youtube.com/playlist?list=PLBexUsYDijaz09nH8BVPmPio_16V115i4

## Helm
Helm is an open-source tool that helps you define, install, and manage applications in Kubernetes. Often described as the “package manager for Kubernetes,” Helm bundles Kubernetes manifests (such as Deployments, Services, and ConfigMaps) into reusable, version-controlled “charts.” Using charts, you can:

* Quickly deploy pre-configured apps and services.
* Easily upgrade or roll back an application to a previous version.
* Customize each installation via parameters without duplicating configuration files.

In essence, Helm streamlines the process of packaging all your Kubernetes YAML files for an application or microservice and distributing them as a chart—making Kubernetes deployments more repeatable, maintainable, and shareable.

### Key Concepts
* Charts: a Helm package containing all the resource definitions necessary to run an application, tool, or service in a Kubernetes cluster. Think of it as the Kubernetes equivalent of a Homebrew formula, an Apt dpkg, or a Yum RPM file. A single chart might include everything from Deployments and Services to ConfigMaps and Ingress definitions.
* Repository: a collection of charts that can be searched, shared, and downloaded. This is analogous to Perl's CPAN or the Fedora Package Database, but for Kubernetes packages.
* Release: a specific instance of a chart running in a Kubernetes cluster. Because one chart can often be installed multiple times into the same cluster, each installation is associated with a unique release. For example, if you install a MySQL chart twice for two separate databases, you end up with two releases—each with its own release name and associated resources.

### How Helm Works
* Installation & Release: When you run helm install, Helm interacts with the Kubernetes API to create the necessary resources. Helm also keeps track of the release state, including which chart version was deployed and what values were used. This makes it straightforward to upgrade or roll back a release later using helm upgrade or helm rollback.
* Templating: Helm uses the Go templating engine to merge YAML manifests in the templates/ directory with user-specified values. This allows you to dynamically configure Kubernetes resources without duplicating configuration files.

### Chart Structure
A typical Helm chart has a standardized file and directory layout:
* Chart.yaml: Contains metadata about the chart, including the chart’s name, version, and a description. This file is also accessible from within your templates for reference.
* values.yaml: Defines the default configuration values for the chart. Users can override these defaults during helm install or helm upgrade by providing their own values file or command-line parameters.
* templates/: Holds the template files. When Helm renders a chart, all files in this directory are processed through the Go templating engine. The resulting Kubernetes manifests are then submitted to the cluster.
* charts/:  May contain other charts, often referred to as "subcharts." These subcharts can be dependencies, allowing you to compose multiple charts together into a larger application stack.
