package com.github.bytestrick.tabula.service;

import org.springframework.stereotype.Service;

import java.util.Objects;

import static java.lang.Math.abs;

@Service
public class FuzzySearch {

    public static float similarity(String a, String b) {
        return (1 - (float) levenshtein(a, b) / Math.max(a.length(), b.length()));
    }

    public static int levenshtein(String a, String b) {
        return distance(a, b, -1);
    }

    public static boolean levenshtein(String a, String b, int max) {
        int d = distance(a, b, max);
        return d <= max;
    }

    private static int min(int ... a) {
        int min = a[0];

        for (int i: a)
            if (i < min)
                min = i;

        return min;
    }

    private static int distance(String a, String b, int max) {
        if (Objects.equals(a, b)) return 0;

        a = a.toLowerCase();
        b = b.toLowerCase();

        int lenA = a.length();
        int lenB = b.length();

        if (max >= 0 && abs(lenA - lenB) > max) return max + 1;
        if (lenA == 0) return lenB;
        if (lenB == 0) return lenA;

        if (lenA < lenB) {
            int tl = lenA;
            lenA = lenB;
            lenB = tl;

            String ts = a;
            a = b;
            b = ts;
        }

        int[] cost = new int[lenB + 1];

        for (int i = 0; i <= lenB; i += 1) {
            cost[i] = i;
        }

        for (int i = 1; i <= lenA; i += 1) {
            cost[0] = i;
            int prv = i - 1;
            int min = prv;

            for (int j = 1; j <= lenB; j += 1) {
                int act = prv + (a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1);
                cost[j] = min(1 + (prv = cost[j]), 1 + cost[j - 1], act);
                if (prv < min) min = prv;
            }

            if (max >= 0 && min > max)
                return max + 1;
        }

        if (max >= 0 && cost[lenB] > max)
            return max + 1;

        return cost[lenB];
    }
}
