---
layout: page
title: "A list of apps"
permalink: "/apps/"
---

<ul>
  {% for app in site.apps %}
    <li>
      <a href="{{ app.url }}">{{ app.title }}</a>
      - {{ app.headline }}
    </li>
  {% endfor %}
</ul>